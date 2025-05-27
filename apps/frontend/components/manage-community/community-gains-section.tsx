import { useTranslations } from "next-intl";
import { CommunityRevenueDistribution } from "../shared/community/fields/CommunityRevenueDistribution";
import { CommunityPriceField } from "../shared/community/fields/CommunityPriceField";

interface Props {
  form: any;
  errors: any;
  register: any;
  totalRepartition: number;
  repartitionError: string;
  snowledgePercentage: number;
  price: number;
}

export function CommunityGainsSection({
  form,
  errors,
  register,
  totalRepartition,
  repartitionError,
  snowledgePercentage,
  price,
}: Props) {
  const t = useTranslations("communityForm");

  return (
    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
      <div className="col-span-8 lg:col-span-4">
        <h2 className="text-lg font-semibold mb-1">
          {t("manage.gains.title")}
        </h2>

        <p className="text-sm text-muted-foreground">
          {t("manage.gains.description")}
        </p>
      </div>
      <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
        <CommunityPriceField
          register={register}
          error={errors.price?.message}
          t={t}
          price={price}
        />
        <CommunityRevenueDistribution
          register={register}
          t={t}
          totalRepartition={totalRepartition}
          price={form.price}
          yourPercentage={form.yourPercentage}
          communityPercentage={form.communityPercentage}
          snowledgePercentage={snowledgePercentage}
          repartitionError={repartitionError}
          errors={errors}
        />
      </div>
    </section>
  );
}
