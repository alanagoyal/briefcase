import { useI18n } from "@quetzallabs/i18n";

const { t } = useI18n();
export const siteConfig = {
  name: t("Briefcase"),
  description: t(
    "The AI legal assistant for fast-moving founders and investors"
  ),
  url: "https://briefcase-ai.vercel.app",
  ogImage: "https://base-case-images.s3.us-west-1.amazonaws.com/briefcase.png",
};
