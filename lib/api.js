const API_URL = process.env.WORDPRESS_API_URL

async function fetchAPI(query, { variables } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      'Authorization'
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  const json = await res.json()
  if (json.errors) {
    console.error(json.errors)
    throw new Error('Failed to fetch API')
  }
  return json.data
}

export async function getPreviewPost(id, idType = 'DATABASE_ID') {
  const data = await fetchAPI(
    `
    query PreviewPost($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        databaseId
        slug
        status
      }
    }`,
    {
      variables: { id, idType },
    }
  )
  return data.post
}

export async function getAllPostsWithSlug() {
  const data = await fetchAPI(`
    {
      posts(first: 10000) {
        edges {
          node {
            slug
          }
        }
      }
    }
  `)
  return data?.posts
}

export async function getAllPostsForHome(preview) {
  const data = await fetchAPI(
    `
    query AllPosts {
      posts(first: 20, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
              }
            }
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
          }
        }
      }
    }
  `,
    {
      variables: {
        onlyEnabled: !preview,
        preview,
      },
    }
  )

  return data?.posts
}

export async function getPostAndMorePosts(slug, preview, previewData) {
  const postPreview = preview && previewData?.post
  // The slug may be the id of an unpublished post
  const isId = Number.isInteger(Number(slug))
  const isSamePost = isId
    ? Number(slug) === postPreview.id
    : slug === postPreview.slug
  const isDraft = isSamePost && postPreview?.status === 'draft'
  const isRevision = isSamePost && postPreview?.status === 'publish'
  const data = await fetchAPI(
    `
    fragment AuthorFields on User {
      name
      firstName
      lastName
      avatar {
        url
      }
    }
    fragment PostFields on Post {
      title
      excerpt
      slug
      date
      featuredImage {
        node {
          sourceUrl
        }
      }
      author {
        node {
          ...AuthorFields
        }
      }
      categories {
        edges {
          node {
            name
          }
        }
      }
      tags {
        edges {
          node {
            name
          }
        }
      }
    }
    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...PostFields
        content
        ${
          // Only some of the fields of a revision are considered as there are some inconsistencies
          isRevision
            ? `
        revisions(first: 1, where: { orderby: { field: MODIFIED, order: DESC } }) {
          edges {
            node {
              title
              excerpt
              content
              author {
                node {
                  ...AuthorFields
                }
              }
            }
          }
        }
        `
            : ''
        }
      }
      posts(first: 3, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...PostFields
          }
        }
      }
    }
  `,
    {
      variables: {
        id: isDraft ? postPreview.id : slug,
        idType: isDraft ? 'DATABASE_ID' : 'SLUG',
      },
    }
  )

  // Draft posts may not have an slug
  if (isDraft) data.post.slug = postPreview.id
  // Apply a revision (changes in a published post)
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node

    if (revision) Object.assign(data.post, revision)
    delete data.post.revisions
  }

  // Filter out the main post
  data.posts.edges = data.posts.edges.filter(({ node }) => node.slug !== slug)
  // If there are still 3 posts, remove the last one
  if (data.posts.edges.length > 2) data.posts.edges.pop()

  return data
}

export const getFrontPage = async () => {
  const allPages = await fetchAPI(`
  query MyQuery {
    pages {
      nodes {
        pageId
        id
        isFrontPage
      }
    }
  }
  `)

  const frontPageId = allPages.pages.nodes.find( ({ isFrontPage }) => isFrontPage ).id

  const frontPage = await fetchAPI(`
  fragment SEO on Page {
    seo {
      breadcrumbs {
        text
        url
      }
      cornerstone
      focuskw
      fullHead
      metaDesc
      metaKeywords
      metaRobotsNofollow
      metaRobotsNoindex
      opengraphAuthor
      opengraphDescription
      opengraphModifiedTime
      opengraphPublishedTime
      opengraphPublisher
      opengraphSiteName
      opengraphTitle
      opengraphType
      opengraphUrl
      readingTime
      schema {
        articleType
        pageType
        raw
      }
      title
      twitterDescription
      twitterTitle
      opengraphImage {
        mediaItemUrl
      }
      twitterImage {
        mediaItemUrl
      }
    }
  }
  query MyQuery {
    page(id: "${frontPageId}") {
      id
      title(format: RENDERED)
      uri
      content(format: RENDERED)
      date
      pageId
      pageCustomFields {
        section1 {
          content
          title
          picture {
            id
            mediaItemId
            mediaItemUrl
            mediaType
            mimeType
          }
          fieldGroupName
        }
        section2 {
          content
          title
          picture {
            id
            mediaItemId
            mediaItemUrl
            mediaType
            mimeType
          }
          fieldGroupName
        }
        section3 {
          content
          title
          picture {
            id
            mediaItemId
            mediaItemUrl
            mediaType
            mimeType
          }
          fieldGroupName
        }
        section4 {
          content
          title
          picture {
            id
            mediaItemId
            mediaItemUrl
            mediaType
            mimeType
          }
          fieldGroupName
        }
        section5 {
          content
          title
          picture {
            id
            mediaItemId
            mediaItemUrl
            mediaType
            mimeType
          }
          fieldGroupName
        }
      }
      ...SEO
    }
  }  
  `)

  return frontPage
}

export const getPrimaryMenu = async () => {
  const allMenus = await fetchAPI(`
  query MyQuery {
    menus {
      nodes {
        id
        locations
        menuItems {
          nodes {
            cssClasses
            databaseId
            description
            id
            isRestricted
            label
            linkRelationship
            order
            parentDatabaseId
            parentId
            path
            target
            title
          }
        }
      }
    }
  }  
  `)

  const primaryMenu = allMenus.menus.nodes.find( ({ locations }) => locations.includes('PRIMARY') )

  return primaryMenu
}

export async function getAllPagesWithSlug() {
  const data = await fetchAPI(`
  {
    pages {
      nodes {
        slug
        locale {
          locale
          id
        }
      }
    }
  }  
  `)

  return data.pages.nodes.filter(({ locale }) => (locale.id == 'en_US'))
}

export async function getPageBySlug(slug) {
  const data = await fetchAPI(`
  fragment SEO on Page {
    seo {
      breadcrumbs {
        text
        url
      }
      cornerstone
      focuskw
      fullHead
      metaDesc
      metaKeywords
      metaRobotsNofollow
      metaRobotsNoindex
      opengraphAuthor
      opengraphDescription
      opengraphModifiedTime
      opengraphPublishedTime
      opengraphPublisher
      opengraphSiteName
      opengraphTitle
      opengraphType
      opengraphUrl
      readingTime
      schema {
        articleType
        pageType
        raw
      }
      title
      twitterDescription
      twitterTitle
      opengraphImage {
        mediaItemUrl
      }
      twitterImage {
        mediaItemUrl
      }
    }
  }
  
  fragment PageFields on Page {
    id
    title(format: RENDERED)
    uri
    content(format: RENDERED)
    date
    pageId
    pageCustomFields {
      section1 {
        content
        title
        picture {
          id
          mediaItemId
          mediaItemUrl
          mediaType
          mimeType
        }
        fieldGroupName
      }
      section2 {
        content
        title
        picture {
          id
          mediaItemId
          mediaItemUrl
          mediaType
          mimeType
        }
        fieldGroupName
      }
      section3 {
        content
        title
        picture {
          id
          mediaItemId
          mediaItemUrl
          mediaType
          mimeType
        }
        fieldGroupName
      }
      section4 {
        content
        title
        picture {
          id
          mediaItemId
          mediaItemUrl
          mediaType
          mimeType
        }
        fieldGroupName
      }
      section5 {
        content
        title
        picture {
          id
          mediaItemId
          mediaItemUrl
          mediaType
          mimeType
        }
        fieldGroupName
      }
    }
    ...SEO
    locale {
      locale
      id
    }
  }
  
  query MyQuery {
    pageBy(uri: "${slug}") {
      ...PageFields
      ...SEO
      translated {
        ...PageFields
      }
    }
  }
  `)

  return data.pageBy
}

export async function getAvailableLocales() {  
  const data = await fetchAPI(`
  query MyQuery {
    locales
    languages {
      code
      default_locale
      id
      is_hidden
      native_name
      translated_name
    }
  }
  `)

  return data
}