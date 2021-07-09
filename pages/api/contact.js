import FormData from 'form-data'

const WP_URL = process.env.WORDPRESS_BASE_URL
const CONTACT_FORM_ID = process.env.CONTACT_FORM_ID

const submitUrl = `${WP_URL}/wp-json/contact-form-7/v1/contact-forms/${CONTACT_FORM_ID}/feedback`

export default async function Contact(req, res) {
  const body = JSON.parse(req.body)

  console.log(submitUrl)

  const {name, email, message, submit} = body

  const formData = new FormData()
  formData.append('name', name)
  formData.append('email', email)
  formData.append('message', message)
  formData.append('submit', submit)

  const wpContactFormRes = await fetch(submitUrl, {
    method: 'post',
    body: formData,
  })

  const resString = await wpContactFormRes.text()

  const json = JSON.parse(resString)

  if (json.errors) {
    console.error(json.errors)
    throw new Error('Failed to fetch API')
  }

  res.status(200).json(json)
}