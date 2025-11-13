// Example usage:
// const randomString = generateRandomString(10); // Generates a 10-character random string
// console.log(randomString);
export function randStr(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * using crypto, the first id is letter. Returned value contain '-' character
 * @returns 
 */
export function generateId(): string {
  return randStr(1) + crypto.randomUUID();
}

/**
 * will be get the end of filename with fileformat
 * @param uri 
 * @returns 
 */
export function getFilenameFromUri(uri:string, name:string|null = null) :string{
  try {
    // Create a URL object
    const url = new URL(uri);

    // Get the pathname part (e.g., '/path/to/file.html')
    const pathname = url.pathname;

    // Extract the last segment after the last '/'
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

    return filename;
  } catch (error) {
    if(name) return name;
    // Handle invalid URLs, e.g., if uri is a relative path
    // or not a valid URL format for the URL constructor.

    // A fallback for relative paths or general strings:
    // First, remove query and hash using string methods
    let cleanString = uri.split('#')[0].split('?')[0];

    // Then get the last part
    const filenameFallback = cleanString.substring(cleanString.lastIndexOf('/') + 1);

    return filenameFallback;
  }
}