export function parsePaginationParams(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20))
  const offset = (page - 1) * limit
  const sortBy = query.sortBy || 'created_at'
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc'
  return { page, limit, offset, sortBy, sortOrder }
}

export function paginatedResponse(data, total, { page, limit }) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
