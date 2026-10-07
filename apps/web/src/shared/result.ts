type Success<D> = {
  ok: true
  error?: never
  data: D
}

type Failure<E> = {
  ok: false
  error: E
  data?: never
}

export type Result<D, E> = Success<D> | Failure<E>

export const Result = {
  ok<D>(data: D): Result<D, never> {
    return { ok: true, data }
  },

  fail<E>(error: E): Result<never, E> {
    return { ok: false, error }
  },
}
