import { useEffect, useRef } from "react"

export function useWebSocket(url: string) {
  const socketRef = useRef<WebSocket>(null)

  useEffect(() => {
    const socket = new WebSocket(url)
    socketRef.current = socket

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [url])

  const onOpen = (cb: (socket: WebSocket) => void) => {
    const socket = socketRef.current

    if (!socket) {
      return
    }

    socket.addEventListener("open", () => cb(socket))
  }

  return { onOpen }
}
