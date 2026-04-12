export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    const errors = result.error.issues.map(i => ({
      field: i.path.join('.'),
      message: i.message,
    }))
    return res.status(422).json({ error: 'Validation failed', details: errors })
  }
  req.body = result.data
  next()
}
