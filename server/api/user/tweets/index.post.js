import formidable from "formidable";
import { createTweet } from "../../../db/tweets.js";
import { tweetTransformer } from "../../../transformers/tweet.js";
import { createMediaFile } from "../../../db/mediaFiles.js";
import { uploadToCloudinary } from "../../../utils/cloudinary.js";

export default defineEventHandler(async (event) => {
  const form = formidable({});

  const response = await new Promise((resolve, reject) => {
    form.parse(event.req, (error, fields, files) => {
      if (error) {
        reject(error);
      }
      resolve({ fields, files });
    });
  });

  const { fields, files } = response;
  const userId = event.context?.auth?.user?.id;
  const tweetData = {
    text: fields.text,
    authorId: userId,
  };
  const replyTo = fields.replyTo;
  if (replyTo && replyTo !== "null" && replyTo !== "undefined") {
    tweetData.replyToId = replyTo;
  }

  const tweet = await createTweet(tweetData);
  const filePromises = Object.keys(files).map(async (key) => {
    const file = files[key];
    const cloudinaryResource = await uploadToCloudinary(file.filepath);
    return createMediaFile({
      url: cloudinaryResource.secure_url,
      providerPublicId: cloudinaryResource.public_id,
      userId: userId,
      tweetId: tweet.id,
    });
  });

  await Promise.all(filePromises);

  return {
    tweet: tweetTransformer(tweet),
  };
});
