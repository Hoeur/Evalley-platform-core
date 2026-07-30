import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { ContentWorkspace } from "@/features/content/content-workspace";

export default async function ContentPage() {
  const { user } = await requireModuleAccess("content", "content.read");
  const cms = getEcommerceCore().cms;
  const [banners, pages, footerLinks, footerSocials, footerSettings] =
    await Promise.all([
      cms.listBanners({ perPage: 100 }),
      cms.listStaticPages({ perPage: 100 }),
      cms.listFooterLinks({ perPage: 100 }),
      cms.listFooterSocials({ perPage: 100 }),
      cms.getFooterSettings(),
    ]);

  return (
    <ContentWorkspace
      banners={banners.items}
      pages={pages.items}
      footerLinks={footerLinks.items}
      footerSocials={footerSocials.items}
      footerSettings={footerSettings}
      canManage={hasPermission(user.permissions, "content.manage")}
    />
  );
}
