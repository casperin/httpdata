export {
    HttpData,
    Ok,
    Err,
    ok,
    err,
}

type HttpData<T, E> =
    | Ok<T, E>
    | Err<T, E>

type CaseExpr<T, E, S> = {
    ok: (_: T) => S,
    err: (_: E) => S
}


/**
 * ok
 */

const ok = <T, E>(data: T): Ok<T, E> => new Ok(data)

type OkCase<T, S> = { ok: (_: T) => S }

class Ok<T, E> {
    data: T

    constructor(data: T) {
        this.data = data
    }

    map<S>(f: (_: T) => S) {
        return new Ok<S, E>(f(this.data))
    }

    or<S>(_: S): S | T {
        return this.data
    }

    aseOf<S>(expr: OkCase<T, S>): S {
        return expr.ok(this.data)
    }

    caseOf<S>({ ok }: CaseExpr<T, E, S>): S {
        return ok(this.data)
    }
}


/**
 * err
 */

const err = <T, E>(error: E): Err<T, E> => new Err(error)

type ErrCase<E, S> = { err: (_: E) => S }

class Err<T, E> {
    error: E

    constructor(error: E) {
        this.error = error
    }

    map() {
        return this
    }

    or<S>(other: S): S {
        return other
    }

    aseOf<S>(expr: ErrCase<E, S>): S {
        return expr.err(this.error)
    }

    caseOf<S>({ err }: CaseExpr<T, E, S>): S {
        return err(this.error)
    }
}

////////n////////////////////////////////////////////////////

/**
 * Testing stuff
 */

const create = (n: number): HttpData<number, string> =>
    n > .5 ? ok(32) : err("no good")

const s = create(Math.random())

const v = s
    .map(x => x + 1)
    .or(10)

console.log(v)
console.log(s.or(null))

s.caseOf({
    ok: n => console.log('ok:', n),
    err: e => console.log('error', e),
})

    /*
function foo(httpData: HttpData<number, string>): string {
    return httpData.caseOf({
        ok: n => `I got ${n}`,
        err: e => e
    })
}

console.log(foo(s))
     */
