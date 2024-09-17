const crypto = require("crypto");
const request = require("request");
const fs = require("fs");

const ACCESS_SECRET = process.env.NEXT_PUBLIC_ACR_SECRET;

class CopyrightChecker {
  constructor() {
    this.defaultOptions = {
      host: "identify-us-west-2.acrcloud.com",
      endpoint: "/v1/identify",
      signature_version: "1",
      data_type: "audio",
      secure: true,
      access_key: "0bc2206eaddaa1e228efc9e4da7e3787",
      access_secret: ACCESS_SECRET,
    };
  }

  // ACRCloud boiler plate from docs
  buildStringToSign(
    method,
    uri,
    accessKey,
    dataType,
    signatureVersion,
    timestamp
  ) {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join(
      "\n"
    );
  }

  sign(signString, accessSecret) {
    return crypto
      .createHmac("sha1", accessSecret)
      .update(Buffer.from(signString, "utf-8"))
      .digest()
      .toString("base64");
  }

  // Core identify function
  identify(data, cb) {
    const current_data = new Date();
    const timestamp = Math.floor(current_data.getTime() / 1000);

    const stringToSign = this.buildStringToSign(
      "POST",
      this.defaultOptions.endpoint,
      this.defaultOptions.access_key,
      this.defaultOptions.data_type,
      this.defaultOptions.signature_version,
      timestamp
    );

    const signature = this.sign(
      stringToSign,
      this.defaultOptions.access_secret
    );

    const formData = {
      sample: data,
      access_key: this.defaultOptions.access_key,
      data_type: this.defaultOptions.data_type,
      signature_version: this.defaultOptions.signature_version,
      signature: signature,
      sample_bytes: data.length,
      timestamp: timestamp,
    };

    request.post(
      {
        url:
          "http://" + this.defaultOptions.host + this.defaultOptions.endpoint,
        method: "POST",
        formData: formData,
      },
      cb
    );
  }

  // A method to process uploaded file
  identifyUploadedFile(filePath, callback) {
    // Read the uploaded file
    const bitmap = fs.readFileSync(filePath);

    // Identify using the file buffer
    this.identify(Buffer.from(bitmap), callback);
  }
}

module.exports = CopyrightChecker;
