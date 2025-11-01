import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_notauth/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_notauth/auth/login"!</div>
}
