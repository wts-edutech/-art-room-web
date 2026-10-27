import { redirect } from "next/navigation";

// Redirect legacy /submit-work to the fully-featured /submissions portal
export default function SubmitWorkRedirect() {
  redirect("/submissions");
}
