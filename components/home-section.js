
export default function HomeSection({ content, title, picture }) {
  const isContentAvailable = content || title || picture

  if (!isContentAvailable) return <></>

  return (
    <div className="max-w-2xl mx-auto my-8">
      { (title != null) ? <h3 className="text-4xl my-4 md:text-center">{title}</h3> : <></> }
      { (picture != null && 'mediaItemUrl' in  picture) ? <img className="my-4 mx-auto" src={picture.mediaItemUrl} /> : <></> }
      { (content != null) ? <div className="text-lg my-4 md:text-center" dangerouslySetInnerHTML={{ __html: content }}/> : <></> }
    </div>
  )
}
