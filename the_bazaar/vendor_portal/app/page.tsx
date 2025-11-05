/**
 * Home Page - Redirects to vendor registration
 * 
 * @author The Bazaar Development Team
 */

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/vendor/register");
}
