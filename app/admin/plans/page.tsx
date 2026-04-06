import { PlansManager } from "@/components/admin/plans-manager"
import { getCarriersAdmin, getPlansAdmin } from "@/lib/data/queries"

export default async function AdminPlansPage() {
  const [plans, carriers] = await Promise.all([
    getPlansAdmin(),
    getCarriersAdmin(),
  ])
  return <PlansManager plans={plans} carriers={carriers} />
}
