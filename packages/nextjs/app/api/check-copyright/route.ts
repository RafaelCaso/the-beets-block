import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import FormData from "form-data";
import fetch from "node-fetch";

const ACR_SECRET: string = process.env.NEXT_PUBLIC_ACR_SECRET || "";

interface ACRCloudOptions {
  host: string;
  endpoint: string;
  signature_version: string;
  data_type: string;
  secure: boolean;
  access_key: string;
  access_secret: string;
}

interface ACRCloudResponse {
  status: {
    code: number;
    msg: string;
  };
  metadata?: {
    music: {
      title: string;
      artists: { name: string }[];
    }[];
  };
}

const defaultOptions: ACRCloudOptions = {
  host: "identify-us-west-2.acrcloud.com",
  endpoint: "/v1/identify",
  signature_version: "1",
  data_type: "audio",
  secure: true,
  access_key: "0bc2206eaddaa1e228efc9e4da7e3787",
  access_secret: ACR_SECRET,
};

function buildStringToSign(
  method: string,
  uri: string,
  accessKey: string,
  dataType: string,
  signatureVersion: string,
  timestamp: number,
): string {
  return [method, uri, accessKey, dataType, signatureVersion, timestamp].join("\n");
}

function sign(signString: string, accessSecret: string): string {
  return crypto.createHmac("sha1", accessSecret).update(Buffer.from(signString, "utf-8")).digest().toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const buffer = Buffer.from(await req.arrayBuffer());
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = buildStringToSign(
      "POST",
      defaultOptions.endpoint,
      defaultOptions.access_key,
      defaultOptions.data_type,
      defaultOptions.signature_version,
      timestamp,
    );
    const signature = sign(stringToSign, defaultOptions.access_secret);

    const form = new FormData();
    form.append("sample", buffer, { filename: "sample.mp3" });
    form.append("sample_bytes", buffer.length.toString());
    form.append("access_key", defaultOptions.access_key);
    form.append("data_type", defaultOptions.data_type);
    form.append("signature_version", defaultOptions.signature_version);
    form.append("signature", signature);
    form.append("timestamp", timestamp.toString());

    const formStream = form as unknown as NodeJS.ReadableStream;

    const acrResponse = await fetch(`https://${defaultOptions.host}${defaultOptions.endpoint}`, {
      method: "POST",
      body: formStream,
    });

    const acrResponseText = await acrResponse.text();
    const result = JSON.parse(acrResponseText) as ACRCloudResponse;

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Error during copyright check", details: (error as Error).message },
      { status: 500 },
    );
  }
}
