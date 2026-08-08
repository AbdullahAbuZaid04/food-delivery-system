import OwnerPageHeader from "@components/owner/OwnerPageHeader";
import MenuManager from "@components/owner/MenuManager";

export default function OwnerMenuPage() {
  return (
    <div>
      <OwnerPageHeader
        title="المنيو"
        subtitle="أصنافك وفئاتك — زيّنها عشان الزبائن يطلبو منك أكتر"
      />
      <MenuManager />
    </div>
  );
}
