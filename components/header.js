import Link from 'next/link'
import Menu from './menu'

export default function Header({ menu }) {  
  return (
    <h2 className="tracking-tight md:tracking-tighter leading-tight mb-20 mt-8">
      <Link href="/">
        <a className="font-bold text-2xl md:text-4xl hover:underline">Blog</a>
      </Link>
      <Menu {...menu} />
    </h2>
  )
}
