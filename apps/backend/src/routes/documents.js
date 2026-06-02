import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DocumentController } from '../controllers/DocumentController.js'
import { requireAuth } from '../middleware/auth.js'
import {
  requireAdminForDelete,
  requireStaff,
} from '../middleware/authorization.js'
import { validate } from '../middleware/validate.js'
import { documentCreateSchema } from '../schemas/index.js'

const router = Router()

// Documents are managed by syndic staff. Copropriétaires access the
// documents shared with them through the /api/extranet routes instead;
// the generic management routes are not scoped per copropriété and must
// therefore stay staff-only.
router.use(requireAuth(), requireStaff)

// Resolve uploads directory relative to backend root
const uploadsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../uploads/documents'
)

// Ensure uploads directory exists on module load
fs.mkdirSync(uploadsDir, { recursive: true })

// Configure multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

// Allowed file extensions and their MIME types
const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.jpg', '.jpeg', '.png', '.gif',
  '.doc', '.docx', '.xls', '.xlsx',
  '.csv', '.txt', '.zip',
])

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        `File type not allowed: ${ext}. Allowed types: ${[...ALLOWED_EXTENSIONS].join(', ')}`
      ),
      false
    )
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter,
})

// Upload a document with file
router.post('/upload', requireAuth(), upload.single('file'), DocumentController.upload)

// Download a document file
router.get('/:id/download', requireAuth(), DocumentController.download)

// Get documents by entity type and id
router.get('/entity/:entiteType/:entiteId', requireAuth(), DocumentController.getAllByEntity)

// Existing routes
router.get('/copropriete/:coproprieteId', requireAuth(), DocumentController.getAllByCopropriete)
router.get('/:id', requireAuth(), DocumentController.getById)
router.post('/', requireAuth(), validate(documentCreateSchema), DocumentController.create)
router.put('/:id', requireAuth(), DocumentController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, DocumentController.delete)

export default router
