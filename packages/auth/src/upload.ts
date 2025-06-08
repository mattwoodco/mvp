import { uploadAvatar as serverUploadAvatar } from "./actions/upload";

export async function uploadAvatar(file: File) {
  return serverUploadAvatar(file);
}
