import 'dotenv/config';
import { config as loadEnv } from "dotenv";
import path from "path";

const envFile = process.env.ENVFILE || './envs/.env.dev'; 
loadEnv({ path: path.resolve(process.cwd(), envFile) });

export default ({ config }: any) => {
  return {
    ...config,
    expo: {
      name: "Finska",
      slug: "finska",
      version: "1.0.0",
      orientation: "portrait",
      android: {
        compileSdkVersion: 34,
        targetSdkVersion: 34,
        package: "com.moates.finska"
      },
      extra: {
        maxNameLength: process.env.MAX_NAME_LENGTH,
        eas: {
          "projectId": "17b301fd-3c8d-46a2-a0cc-90f945dd0f62"
        }
      },
      owner: "moates"
    },
  }
};