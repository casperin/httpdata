export {
    HttpData,
    success,
    error,
}

type HttpData<T, E> =
    | HttpSuccess<T>
    | HttpError<E>

type HttpSuccess<T> = {
    type: "success"
    value: T
    or: <S>(_: S) => T
}

type HttpError<E> = {
    type: "error"
    error: E
    or: <S>(_: S) => S
}

const baseProto = <T>() => ({
    or: function<S>(other: S): T | S {
        return other
    }
})

const successProto = <T>() => ({
    ...baseProto<T>(),
    or: function<S>(this: { value: T }, _other: S): T | S {
        return this.value
    }
})

function success<T>(value: T): HttpSuccess<T> {
    const httpData = Object.create(successProto())
    httpData.type = "success"
    httpData.value = value
    return httpData
}

const errorProto = <T>() => ({
    ...baseProto<T>()
})

function error<E>(error: E): HttpError<E> {
    const httpData = Object.create(errorProto())
    httpData.type = "error"
    httpData.error = error
    return httpData
}

/////////////////////////////////////////////////////////////////////////////////////////////

function create(n: number): HttpData<number, string> {
    return n < .5 ? success(42) : error("ay ay ay!")
}

const s = create(Math.random())

console.log(s.or(1))
