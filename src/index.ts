export {
    HttpData,
    notAsked,
    loading,
    ok,
    updating,
    err,
}

type HttpData<T, E> =
    | NotAsked<T, E>
    | Loading<T, E>
    | Ok<T, E>
    | Updating<T, E>
    | Err<T, E>

interface Helpers<T, E> {
    map: <S>(f: (_: T) => S) => HttpData<S, E>
    mapOrNull: <S>(f: (_: T) => S) => S | null
    mapErr: <G>(f: (_: E) => G) => HttpData<T, G>
    or: <S>(_: S) => T | S
    orElse: <S>(f: () => S) => T | S
}

interface NotAsked<T, E> extends Helpers<T, E> {
    type: "not_asked"
    hasValue: false
    caseOf: <S>(expr: { notAsked: () => S }) => S
}

interface Loading<T, E> extends Helpers<T, E> {
    type: "loading"
    hasValue: false
    caseOf: <S>(expr: { loading: () => S }) => S
}

interface Ok<T, E> extends Helpers<T, E> {
    type: "ok"
    value: T
    hasValue: true
    caseOf: <S>(expr: { ok: (_: T) => S }) => S
}

interface Updating<T, E> extends Helpers<T, E> {
    type: "updating"
    value: T
    hasValue: true
    caseOf: <S>(expr: { updating: (_: T) => S }) => S
}

interface Err<T, E> extends Helpers<T, E> {
    type: "err"
    error: E
    hasValue: false
    caseOf: <S>(expr: { err: (_: E) => S }) => S
}

function notAsked<T, E>(): NotAsked<T, E> {
    return {
        type: "not_asked",
        hasValue: false,
        map: <S>(f: (_: T) => S) => notAsked<S, E>(),
        mapOrNull: () => null,
        mapErr: <G>(f: (_: E) => G) => notAsked<T, G>(),
        or: <S>(other: S): S => other,
        orElse: <S>(f: () => S): S => f(),
        caseOf: ({ notAsked }) => notAsked(),
    }
}

function loading<T, E>(): Loading<T, E> {
    return {
        type: "loading",
        hasValue: false,
        map: <S>(f: (_: T) => S) => loading<S, E>(),
        mapOrNull: () => null,
        mapErr: <G>(f: (_: E) => G) => loading<T, G>(),
        or: <S>(other: S): S => other,
        orElse: <S>(f: () => S): S => f(),
        caseOf: ({ loading }) => loading(),
    }
}

function ok<T, E>(value: T): Ok<T, E> {
    return {
        type: "ok",
        value,
        hasValue: true,
        map: <S>(f: (_: T) => S) => ok<S, E>(f(value)),
        mapOrNull: <S>(f: (_: T) => S) => f(value),
        mapErr: <G>() => ok<T, G>(value),
        or: (_: unknown): T => value,
        orElse: (): T => value,
        caseOf: <S>({ ok }: { ok: (_: T) => S }) => ok(value),
    }
}

function updating<T, E>(value: T): Updating<T, E> {
    return {
        type: "updating",
        value,
        hasValue: true,
        map: <S>(f: (_: T) => S) => ok<S, E>(f(value)),
        mapOrNull: <S>(f: (_: T) => S) => f(value),
        mapErr: <G>() => ok<T, G>(value),
        or: (_: unknown): T => value,
        orElse: (): T => value,
        caseOf: ({ updating }) => updating(value),
    }
}

function err<T, E>(error: E): Err<T, E> {
    return {
        type: "err",
        error,
        hasValue: false,
        map: <S>(f: (_: T) => S) => err<S, E>(error),
        mapOrNull: () => null,
        mapErr: <G>(f: (_: E) => G) => err<T, G>(f(error)),
        or: <S>(other: S): S => other,
        orElse: <S>(f: () => S): S => f(),
        caseOf: ({ err }) => err(error),
    }
}

/**
 * Testing stuff
 */

const create = (n: number): HttpData<number, string> =>
    n > .5 ? ok(32) : err("no good")

const s = create(Math.random())

const v = s
    .map(x => x + 1)
    .or(10)

console.log(s)
console.log(v)

if (s.hasValue) {
    console.log('v had a value', s.value)
}

function foo(k: HttpData<number, string>): string {
    return s.caseOf({
        notAsked: () => 'not asked',
        loading: () => 'loading',
        ok: n => `ok: ${n}`,
        updating: n => `updating ${n}`,
        err: e => e
    })
}

foo(s)
