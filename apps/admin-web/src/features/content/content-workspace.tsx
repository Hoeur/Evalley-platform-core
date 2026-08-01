"use client";

import type {
  Banner,
  BannerDevice,
  FooterLink,
  FooterSettings,
  FooterSocial,
  PublishStatus,
  StaticPage,
} from "@platform/ecommerce-core";
import {
  FileText,
  Image as ImageIcon,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { mediaSrc } from "@/core/utils/media-url";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/ui/dialog";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/design-system/ui/tabs";
import { Textarea } from "@/design-system/ui/textarea";
import {
  deleteBannerAction,
  deleteFooterLinkAction,
  deleteFooterSocialAction,
  deleteStaticPageAction,
  saveBannerAction,
  saveFooterLinkAction,
  saveFooterSettingsAction,
  saveFooterSocialAction,
  saveStaticPageAction,
  uploadBannerImageAction,
} from "./mutations";

const BANNER_DEVICES: readonly BannerDevice[] = ["desktop", "tablet", "phone"];
const BANNER_DEVICE_LABELS: Record<BannerDevice, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  phone: "Phone",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: PublishStatus;
  onChange: (value: PublishStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={(v: PublishStatus) => onChange(v)}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="published">Published</SelectItem>
      </SelectContent>
    </Select>
  );
}

function StatusBadge({ status }: { status: PublishStatus }) {
  return (
    <Badge variant={status === "published" ? "default" : "secondary"}>
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}

type PageForm = {
  title: string;
  slug: string;
  content: string;
  status: PublishStatus;
};
type BannerForm = {
  title: string;
  subtitle: string;
  buttonText: string;
  linkUrl: string;
  status: PublishStatus;
  order: number;
};
type LinkForm = {
  group: string;
  label: string;
  url: string;
  status: PublishStatus;
  order: number;
};
type SocialForm = {
  platform: string;
  url: string;
  status: PublishStatus;
  order: number;
};

const emptyPage: PageForm = {
  title: "",
  slug: "",
  content: "",
  status: "draft",
};
const emptyBanner: BannerForm = {
  title: "",
  subtitle: "",
  buttonText: "",
  linkUrl: "",
  status: "draft",
  order: 0,
};
const emptyLink: LinkForm = {
  group: "",
  label: "",
  url: "",
  status: "published",
  order: 0,
};
const emptySocial: SocialForm = {
  platform: "",
  url: "",
  status: "published",
  order: 0,
};

export function ContentWorkspace({
  banners,
  pages,
  footerLinks,
  footerSocials,
  footerSettings,
  canManage,
}: {
  banners: readonly Banner[];
  pages: readonly StaticPage[];
  footerLinks: readonly FooterLink[];
  footerSocials: readonly FooterSocial[];
  footerSettings: FooterSettings;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [pageDialog, setPageDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage>();
  const [pageForm, setPageForm] = useState(emptyPage);

  const [bannerDialog, setBannerDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner>();
  const [bannerForm, setBannerForm] = useState(emptyBanner);
  const [bannerImage, setBannerImage] = useState<File>();
  const [bannerDevice, setBannerDevice] = useState<BannerDevice>("desktop");

  const [linkDialog, setLinkDialog] = useState(false);
  const [linkForm, setLinkForm] = useState(emptyLink);

  const [socialDialog, setSocialDialog] = useState(false);
  const [socialForm, setSocialForm] = useState(emptySocial);

  const [settings, setSettings] = useState({
    phone: footerSettings.phone ?? "",
    email: footerSettings.email ?? "",
    about: footerSettings.about ?? "",
    address: footerSettings.address ?? "",
  });

  function openPage(page?: StaticPage) {
    setEditingPage(page);
    setPageForm(
      page
        ? {
            title: page.title,
            slug: page.slug,
            content: page.content,
            status: page.status,
          }
        : emptyPage,
    );
    setPageDialog(true);
  }

  function savePage() {
    startTransition(async () => {
      const result = await saveStaticPageAction(
        {
          title: pageForm.title,
          content: pageForm.content,
          slug: pageForm.slug || null,
          status: pageForm.status,
        },
        editingPage?.id,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(editingPage ? "Page updated" : "Page created");
      setPageDialog(false);
      router.refresh();
    });
  }

  function removePage(page: StaticPage) {
    if (!window.confirm(`Delete page "${page.title}"?`)) return;
    startTransition(async () => {
      const result = await deleteStaticPageAction(page.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Page deleted");
      router.refresh();
    });
  }

  function openBanner(banner?: Banner) {
    setEditingBanner(banner);
    setBannerForm(
      banner
        ? {
            title: banner.title,
            subtitle: banner.subtitle ?? "",
            buttonText: banner.buttonText ?? "",
            linkUrl: banner.linkUrl ?? "",
            status: banner.status,
            order: banner.order,
          }
        : emptyBanner,
    );
    setBannerImage(undefined);
    setBannerDevice("desktop");
    setBannerDialog(true);
  }

  function saveBanner() {
    startTransition(async () => {
      const result = await saveBannerAction(
        {
          title: bannerForm.title,
          subtitle: bannerForm.subtitle || null,
          buttonText: bannerForm.buttonText || null,
          linkUrl: bannerForm.linkUrl || null,
          status: bannerForm.status,
          order: bannerForm.order,
        },
        editingBanner?.id,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (bannerImage) {
        const data = new FormData();
        data.append("image", bannerImage);
        data.append("device", bannerDevice);
        const upload = await uploadBannerImageAction(result.item.id, data);
        if (!upload.ok) {
          toast.error(`Banner saved, but image failed: ${upload.error}`);
          return;
        }
      }
      toast.success(editingBanner ? "Banner updated" : "Banner created");
      setBannerDialog(false);
      router.refresh();
    });
  }

  function removeBanner(banner: Banner) {
    if (!window.confirm(`Delete banner "${banner.title}"?`)) return;
    startTransition(async () => {
      const result = await deleteBannerAction(banner.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Banner deleted");
      router.refresh();
    });
  }

  function saveSettings() {
    startTransition(async () => {
      const result = await saveFooterSettingsAction({
        phone: settings.phone || null,
        email: settings.email || null,
        about: settings.about || null,
        address: settings.address || null,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Footer settings saved");
      router.refresh();
    });
  }

  function saveLink() {
    startTransition(async () => {
      const result = await saveFooterLinkAction({
        group: linkForm.group,
        label: linkForm.label,
        url: linkForm.url,
        status: linkForm.status,
        order: linkForm.order,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Footer link added");
      setLinkDialog(false);
      setLinkForm(emptyLink);
      router.refresh();
    });
  }

  function removeLink(link: FooterLink) {
    startTransition(async () => {
      const result = await deleteFooterLinkAction(link.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Footer link removed");
      router.refresh();
    });
  }

  function saveSocial() {
    startTransition(async () => {
      const result = await saveFooterSocialAction({
        platform: socialForm.platform,
        url: socialForm.url,
        status: socialForm.status,
        order: socialForm.order,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Social link added");
      setSocialDialog(false);
      setSocialForm(emptySocial);
      router.refresh();
    });
  }

  function removeSocial(social: FooterSocial) {
    startTransition(async () => {
      const result = await deleteFooterSocialAction(social.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Social link removed");
      router.refresh();
    });
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight">
          Storefront content
        </h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Banners, static pages, and footer managed through the commerce CMS
          API.
        </p>
      </div>

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">
            <FileText className="size-4" /> Pages ({pages.length})
          </TabsTrigger>
          <TabsTrigger value="banners">
            <ImageIcon className="size-4" /> Banners ({banners.length})
          </TabsTrigger>
          <TabsTrigger value="footer">
            <Settings2 className="size-4" /> Footer
          </TabsTrigger>
        </TabsList>

        {/* Pages */}
        <TabsContent value="pages" className="mt-4">
          <Card className="overflow-hidden rounded-2xl shadow-none">
            <div className="flex items-center justify-between border-b p-4">
              <p className="font-semibold">Static pages</p>
              {canManage && (
                <Button onClick={() => openPage()}>
                  <Plus /> Add page
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {page.slug}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={page.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${page.title}`}
                            onClick={() => openPage(page)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${page.title}`}
                            disabled={pending}
                            onClick={() => removePage(page)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {pages.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground h-24 text-center"
                    >
                      No static pages yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Banners */}
        <TabsContent value="banners" className="mt-4">
          <Card className="overflow-hidden rounded-2xl shadow-none">
            <div className="flex items-center justify-between border-b p-4">
              <p className="font-semibold">Homepage banners</p>
              {canManage && (
                <Button onClick={() => openBanner()}>
                  <Plus /> Add banner
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => {
                  const previewUrl =
                    banner.imageUrls.desktop ??
                    banner.imageUrls.tablet ??
                    banner.imageUrls.phone;
                  return (
                  <TableRow key={banner.id}>
                    <TableCell>
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaSrc(previewUrl)}
                          alt=""
                          className="h-10 w-16 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="bg-muted grid h-10 w-16 place-items-center rounded-md border">
                          <ImageIcon className="text-muted-foreground size-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell>{banner.order}</TableCell>
                    <TableCell>
                      <StatusBadge status={banner.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${banner.title}`}
                            onClick={() => openBanner(banner)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${banner.title}`}
                            disabled={pending}
                            onClick={() => removeBanner(banner)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })}
                {banners.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground h-24 text-center"
                    >
                      No banners yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Footer */}
        <TabsContent value="footer" className="mt-4 space-y-4">
          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-base">
                Footer settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone">
                  <Input
                    value={settings.phone}
                    onChange={(event) =>
                      setSettings((s) => ({ ...s, phone: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(event) =>
                      setSettings((s) => ({ ...s, email: event.target.value }))
                    }
                  />
                </Field>
              </div>
              <Field label="About">
                <Textarea
                  value={settings.about}
                  onChange={(event) =>
                    setSettings((s) => ({ ...s, about: event.target.value }))
                  }
                />
              </Field>
              <Field label="Address">
                <Input
                  value={settings.address}
                  onChange={(event) =>
                    setSettings((s) => ({ ...s, address: event.target.value }))
                  }
                />
              </Field>
              {canManage && (
                <div className="flex justify-end">
                  <Button disabled={pending} onClick={saveSettings}>
                    {pending ? "Saving..." : "Save settings"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl shadow-none">
            <div className="flex items-center justify-between border-b p-4">
              <p className="font-semibold">Footer links</p>
              {canManage && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setLinkForm(emptyLink);
                    setLinkDialog(true);
                  }}
                >
                  <Plus /> Add link
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {footerLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>{link.group}</TableCell>
                    <TableCell className="font-medium">{link.label}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {link.url}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${link.label}`}
                          disabled={pending}
                          onClick={() => removeLink(link)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {footerLinks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground h-20 text-center"
                    >
                      No footer links.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Card className="overflow-hidden rounded-2xl shadow-none">
            <div className="flex items-center justify-between border-b p-4">
              <p className="font-semibold">Social links</p>
              {canManage && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSocialForm(emptySocial);
                    setSocialDialog(true);
                  }}
                >
                  <Plus /> Add social
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {footerSocials.map((social) => (
                  <TableRow key={social.id}>
                    <TableCell className="font-medium capitalize">
                      {social.platform}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {social.url}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${social.platform}`}
                          disabled={pending}
                          onClick={() => removeSocial(social)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {footerSocials.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground h-20 text-center"
                    >
                      No social links.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Page dialog */}
      <Dialog open={pageDialog} onOpenChange={setPageDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Edit page" : "Add page"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Title">
              <Input
                value={pageForm.title}
                onChange={(event) =>
                  setPageForm((f) => ({ ...f, title: event.target.value }))
                }
              />
            </Field>
            <Field label="Slug (optional)">
              <Input
                value={pageForm.slug}
                onChange={(event) =>
                  setPageForm((f) => ({ ...f, slug: event.target.value }))
                }
                placeholder="auto-generated-if-empty"
              />
            </Field>
            <Field label="Content">
              <Textarea
                rows={8}
                value={pageForm.content}
                onChange={(event) =>
                  setPageForm((f) => ({ ...f, content: event.target.value }))
                }
              />
            </Field>
            <Field label="Status">
              <StatusSelect
                value={pageForm.status}
                onChange={(status) => setPageForm((f) => ({ ...f, status }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPageDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                pending || !pageForm.title.trim() || !pageForm.content.trim()
              }
              onClick={savePage}
            >
              {pending ? "Saving..." : "Save page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banner dialog */}
      <Dialog open={bannerDialog} onOpenChange={setBannerDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit banner" : "Add banner"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Title">
              <Input
                value={bannerForm.title}
                onChange={(event) =>
                  setBannerForm((f) => ({ ...f, title: event.target.value }))
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Subtitle">
                <Input
                  value={bannerForm.subtitle}
                  onChange={(event) =>
                    setBannerForm((f) => ({
                      ...f,
                      subtitle: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Button text">
                <Input
                  value={bannerForm.buttonText}
                  onChange={(event) =>
                    setBannerForm((f) => ({
                      ...f,
                      buttonText: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="Link URL">
              <Input
                type="url"
                value={bannerForm.linkUrl}
                onChange={(event) =>
                  setBannerForm((f) => ({ ...f, linkUrl: event.target.value }))
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Sort order">
                <Input
                  type="number"
                  min={0}
                  value={bannerForm.order}
                  onChange={(event) =>
                    setBannerForm((f) => ({
                      ...f,
                      order: Number(event.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Status">
                <StatusSelect
                  value={bannerForm.status}
                  onChange={(status) =>
                    setBannerForm((f) => ({ ...f, status }))
                  }
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Device">
                <Select
                  value={bannerDevice}
                  onValueChange={(value) =>
                    setBannerDevice(value as BannerDevice)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANNER_DEVICES.map((device) => (
                      <SelectItem key={device} value={device}>
                        {BANNER_DEVICE_LABELS[device]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Image">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setBannerImage(event.target.files?.[0])}
                />
              </Field>
            </div>
            {editingBanner ? (
              <p className="text-muted-foreground text-xs">
                {editingBanner.imageUrls[bannerDevice]
                  ? `Uploading replaces the current ${BANNER_DEVICE_LABELS[bannerDevice]} image.`
                  : `No ${BANNER_DEVICE_LABELS[bannerDevice]} image yet.`}{" "}
                Each device holds its own image — switch the device to set another.
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                The image is saved for the selected device after the banner is
                created.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBannerDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={pending || !bannerForm.title.trim()}
              onClick={saveBanner}
            >
              {pending ? "Saving..." : "Save banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer link dialog */}
      <Dialog open={linkDialog} onOpenChange={setLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add footer link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Group">
              <Input
                value={linkForm.group}
                onChange={(event) =>
                  setLinkForm((f) => ({ ...f, group: event.target.value }))
                }
                placeholder="e.g. Company"
              />
            </Field>
            <Field label="Label">
              <Input
                value={linkForm.label}
                onChange={(event) =>
                  setLinkForm((f) => ({ ...f, label: event.target.value }))
                }
              />
            </Field>
            <Field label="URL">
              <Input
                value={linkForm.url}
                onChange={(event) =>
                  setLinkForm((f) => ({ ...f, url: event.target.value }))
                }
              />
            </Field>
            <Field label="Status">
              <StatusSelect
                value={linkForm.status}
                onChange={(status) => setLinkForm((f) => ({ ...f, status }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                pending || !linkForm.group.trim() || !linkForm.label.trim()
              }
              onClick={saveLink}
            >
              {pending ? "Saving..." : "Add link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer social dialog */}
      <Dialog open={socialDialog} onOpenChange={setSocialDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add social link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Platform">
              <Input
                value={socialForm.platform}
                onChange={(event) =>
                  setSocialForm((f) => ({ ...f, platform: event.target.value }))
                }
                placeholder="e.g. facebook"
              />
            </Field>
            <Field label="URL">
              <Input
                type="url"
                value={socialForm.url}
                onChange={(event) =>
                  setSocialForm((f) => ({ ...f, url: event.target.value }))
                }
              />
            </Field>
            <Field label="Status">
              <StatusSelect
                value={socialForm.status}
                onChange={(status) => setSocialForm((f) => ({ ...f, status }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSocialDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                pending || !socialForm.platform.trim() || !socialForm.url.trim()
              }
              onClick={saveSocial}
            >
              {pending ? "Saving..." : "Add social"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
