import { getPageBySlug, getPrimaryMenu, getAllPagesWithSlug } from '../lib/api'
import Container from '../components/container'
import ContactForm from '../components/contact-form'
import PostBody from '../components/post-body'
import Header from '../components/header'
import PageHeader from '../components/page-header'
import Layout from '../components/layout'
import HomeSection from '../components/home-section'
import Head from 'next/head'
import parse from 'html-react-parser'
import { useRouter } from "next/router"

export default function Index({ page, primaryMenu }) {
  let post = page

  const { seo } = post
  const yoastHead = parse(seo.fullHead)
  
  const { defaultLocale, locale } = useRouter()

  if (defaultLocale != locale) {
    post = page.translated.find((item) => (item.locale.id == locale))
    if (!post) post = page
  }

  return (
    <Layout>
      <Container>
        <Header menu={primaryMenu} />
        <article>
          <Head>
            {yoastHead}
          </Head>
          <PageHeader
            title={post.title}
          />
          <PostBody content={post.content} />
          <div className="max-w-xl mx-auto">
            <ContactForm />
          </div>
          <HomeSection {...post.pageCustomFields.section1}/>
          <HomeSection {...post.pageCustomFields.section2}/>
          <HomeSection {...post.pageCustomFields.section3}/>
          <HomeSection {...post.pageCustomFields.section4}/>
          <HomeSection {...post.pageCustomFields.section5}/>
        </article>
      </Container>
    </Layout>
  )
}

export async function getStaticProps() {
  const page = await getPageBySlug('contact-us')
  const primaryMenu = await getPrimaryMenu()

  return {
    props: { page, primaryMenu },
    revalidate: 30,
  }
}