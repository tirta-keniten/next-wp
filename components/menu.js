
import Link from 'next/link'
import { useRouter } from "next/router"

export default function Menu({ menuItems }) {

  const router = useRouter()

  const className = "border-b-2 text-2xl border-transparent hover:text-gray-800 hover:border-blue-500"
  const activeClassName = "border-b-2 text-2xl border-transparent text-gray-800 border-blue-500"

  const { locale, locales } = router

  const changeLanguage = (e) => {
    const locale = e.target.value;
    router.push(router.pathname, router.asPath, { locale })
  }

  return (
    <nav>
      <ul className="flex md:items-center flex-col md:flex-row md:justify-center mt-6 text-gray-600 capitalize">
      { menuItems.nodes.map((item, index) => {
        return (
          <li key={`menu-${index}`}
            className="md:mx-4 my-1">
            <Link 
              href={item.path}>
                <a className={`${router.asPath}/` == item.path ? activeClassName : className}>
                {item.label}
                </a>
            </Link>
          </li>
        )
      }) }
        <li className="md:mx-4 my-1">
          <select
              onChange={changeLanguage}
              defaultValue={locale}
              className={className}
            >
              {locales.map((lang, index) => (
                <option key={`menu-${index}`}
                  className="text-black" 
                  value={lang}>{ lang }</option>
              ))}
          </select>
        </li>
      </ul>
    </nav>
  )
}
