import { defineConfig } from "tsup";
import { copyFile, readdir } from "node:fs/promises";
import path from "node:path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  
  async onSuccess() {
    const srcDir = path.resolve("src/grpc");
    const distDir = path.resolve('dist');
    
    try {
      const allFiles = await readdir(srcDir, { recursive: true });
      
      const protoFiles = allFiles.filter(file => file.endsWith(".proto"));
      
      for (const file of protoFiles) {
        const sourcePath = path.resolve(srcDir, file);
        const destPath = path.resolve(distDir, path.basename(file));
        
        await copyFile(sourcePath, destPath);
        console.log(`[INFO] File .proto copied to dist/: ${path.basename(file)}`);
      }
    } catch (error) {
      console.error('[ERROR] Failed to copy .proto file: ', error);
    }
  },
});
