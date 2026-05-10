import 'dotenv/config';
import { config as loadEnv } from "dotenv";
import path from "path";

const envFile = process.env.ENVFILE || './envs/.env.dev'; 
loadEnv({ path: path.resolve(process.cwd(), envFile) });

export default ({ config }: any) => {
  return {
    ...config,
    expo: {
      name: "Woodchuck",
      slug: "finska",
      version: "0.0.4",
      orientation: "portrait",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      runtimeVersion: {
        policy: "appVersion"
      },
      updates: {
        url: "https://u.expo.dev/17b301fd-3c8d-46a2-a0cc-90f945dd0f62"
      },
      android: {
        versionCode: 3,
        package: "au.com.moates.woodchuck",
        adaptiveIcon: {
          foregroundImage: "./assets/images/icon.png",
          backgroundColor: "#ffedaaff",
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        displayName: "Woodchuck"
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.moates.finska"
      },
      extra: {
        maxNameLength: process.env.MAX_NAME_LENGTH,
        eas: {
          "projectId": "17b301fd-3c8d-46a2-a0cc-90f945dd0f62"
        }
      },
      owner: "moates",
      plugins: [
        [
          "expo-build-properties",
          {
            "android": {
              "compileSdkVersion": 35,
              "targetSdkVersion": 35,
              "enable16KbPageAlignedSoFiles": true
            }
          }
        ],
        "expo-asset",
        "expo-font",
        [
          "expo-splash-screen",
          {
            backgroundColor: "#ffffff",
            image: "./assets/images/splash-icon.png",
            dark: {
              image: "./assets/images/splash-icon.png",
              backgroundColor: "#181818",
            },
            imageWidth: 200,
          }
        ]
      ],
      icon: "./assets/images/icon.png",
    },
  }
};