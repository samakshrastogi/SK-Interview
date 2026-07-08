import mongoose, { Schema, Document } from 'mongoose';

export interface ITokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const TokenSchema = new Schema<ITokenDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index
  },
}, {
  timestamps: true,
});

export const Token = mongoose.model<ITokenDocument>('Token', TokenSchema);
