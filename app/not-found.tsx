import Link from "next/link";
export default function NotFound() {
  return (<div className="space-y-3 pt-16 text-center"><h1 className="h-title">Page not found</h1><Link href="/read" className="btn-primary">Back to Read</Link></div>);
}
