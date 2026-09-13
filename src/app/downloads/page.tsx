import { redirect } from "next/navigation";

export default function DownloadsPage() {
  redirect("/materials?type=pdf");
}
