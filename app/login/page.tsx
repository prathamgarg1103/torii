import LoginForm from "@/components/LoginForm";
export const metadata = { title: "Sign in" };
export default function Login({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next && searchParams.next.startsWith("/") ? searchParams.next : "/read";
  return <LoginForm next={next} />;
}
