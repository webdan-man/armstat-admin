import React from "react";

import { ContactUsEditor } from "@/components/contact-us/ContactUsEditor";
import { requirePermission } from "@/lib/require-permission";

export default async function ContactUsPage() {
  await requirePermission("contact-us");

  return <ContactUsEditor />;
}
