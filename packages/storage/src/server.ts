import {
  del,
  head,
  copy as vercelCopy,
  list as vercelList,
  put as vercelPut,
} from "@vercel/blob";
import {
  copyLocal,
  existsLocal,
  listLocal,
  putLocal,
  removeLocal,
} from "./minio-local";
import { checkToken, createPath, isLocalEnv } from "./utils";

const token = process.env.BLOB_READ_WRITE_TOKEN;

export async function putServer(
  filename: string,
  data: Blob | Buffer | ReadableStream,
): Promise<string | null> {
  if (isLocalEnv()) {
    return await putLocal(filename, data);
  }

  checkToken();
  const blob = await vercelPut(createPath(filename), data, {
    access: "public",
    token,
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function removeServer(filename: string): Promise<boolean> {
  if (isLocalEnv()) {
    return await removeLocal(filename);
  }

  checkToken();
  try {
    await del(createPath(filename), { token });
    return true;
  } catch {
    return false;
  }
}

export async function existsServer(filename: string): Promise<boolean> {
  if (isLocalEnv()) {
    return await existsLocal(filename);
  }

  checkToken();
  try {
    await head(createPath(filename), { token });
    return true;
  } catch {
    return false;
  }
}

export async function listServer(prefix = ""): Promise<string[]> {
  if (isLocalEnv()) {
    return await listLocal(prefix);
  }

  checkToken();
  const { blobs } = await vercelList({
    prefix: `storage/${prefix}`,
    token,
  });
  return blobs.map((blob: any) => blob.pathname.replace("storage/", ""));
}

export async function copyServer(
  from: string,
  to: string,
): Promise<string | null> {
  if (isLocalEnv()) {
    return await copyLocal(from, to);
  }

  checkToken();
  const blob = await vercelCopy(createPath(from), createPath(to), {
    access: "public",
    token,
  });
  return blob.url;
}
