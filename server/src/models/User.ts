import mongoose, { Schema, type InferSchemaType } from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password)
}

userSchema.set('toJSON', {
  transform: (_doc, ret: { password?: string }) => {
    delete ret.password
    return ret
  },
})

export type UserDocument = Omit<InferSchemaType<typeof userSchema>, 'password'> & {
  password?: string
  comparePassword: (plain: string) => Promise<boolean>
}

export const User = mongoose.model<UserDocument>('User', userSchema)
