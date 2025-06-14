import React from "react";
import { Button } from "../../../ui/button";
import { Loader2 } from "lucide-react";

// Definiujemy typ dla pojedynczego planu, aby komponent był elastyczny
export interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId: string; // Kluczowe: ID ceny miesięcznej ze Stripe
  yearlyPriceId: string; // Kluczowe: ID ceny rocznej ze Stripe
  isPopular?: boolean;
}

interface PricingInteractionProps {
  plans: Plan[]; // Przyjmujemy listę planów
  isLoading: boolean;
  onSubscribeClick: (priceId: string) => void; // Funkcja do obsługi subskrypcji
}

export function PricingInteraction({ plans, isLoading, onSubscribeClick }: PricingInteractionProps) {
  const [activePlanIndex, setActivePlanIndex] = React.useState(0);
  const [period, setPeriod] = React.useState(0); // 0 = Monthly, 1 = Yearly

  const handleGetStarted = () => {
    const selectedPlan = plans[activePlanIndex];
    if (!selectedPlan) return;

    const priceIdToSubscribe = period === 0 ? selectedPlan.monthlyPriceId : selectedPlan.yearlyPriceId;
    
    onSubscribeClick(priceIdToSubscribe);
  };

  const getActivePlanTransform = () => {
    const baseHeight = 64;
    const gap = 12;
    // Plan "Free" jest statyczny, więc obliczamy offset dla planów płatnych
    const offset = (activePlanIndex + 1) * (baseHeight + gap);
    return `translateY(${offset}px)`;
  };

  return (
    <div className="border rounded-xl p-4 max-w-sm w-full flex flex-col items-center gap-4 bg-card">
      <div className="rounded-full relative w-full bg-muted p-1 flex items-center">
        <button
          className="font-medium rounded-full w-full py-2 px-3 text-sm z-20 transition-colors"
          onClick={() => setPeriod(0)}
        >
          Monthly
        </button>
        <button
          className="font-medium rounded-full w-full py-2 px-3 text-sm z-20 transition-colors"
          onClick={() => setPeriod(1)}
        >
          Yearly
        </button>
        <div
          className="py-2 px-3 flex items-center justify-center absolute inset-0 w-1/2 z-10"
          style={{
            transform: `translateX(${period * 100}%)`,
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="bg-background shadow-sm rounded-full w-full h-full border"></div>
        </div>
      </div>

      <div className="w-full relative flex flex-col items-center justify-center gap-3">
        {/* Statyczny plan Free */}
        <div className="w-full flex justify-between border p-3 rounded-lg h-16 opacity-50 cursor-not-allowed">
            <p className="font-semibold text-lg">Free</p>
            <p className="text-muted-foreground text-sm"><span className="text-foreground font-medium">$0.00</span>/month</p>
        </div>
        
        {/* Dynamiczne plany */}
        {plans.map((plan, index) => {
            const price = period === 0 ? plan.monthlyPrice : plan.yearlyPrice;
            const isActive = activePlanIndex === index;

            return (
                <div
                    key={plan.name}
                    className="w-full flex justify-between cursor-pointer border p-3 rounded-lg hover:bg-muted/50 transition-colors h-16"
                    onClick={() => setActivePlanIndex(index)}
                >
                    <div className="flex flex-col items-start justify-center">
                        <p className="font-semibold text-lg flex items-center gap-2">
                        {plan.name}
                        {plan.isPopular && <span className="py-0.5 px-2 rounded-md bg-yellow-100 text-yellow-800 text-xs font-medium dark:bg-yellow-900 dark:text-yellow-200">Popular</span>}
                        </p>
                        <p className="text-muted-foreground text-sm flex">
                        <span className="text-foreground font-medium flex items-center">${price}</span>
                        /month
                        </p>
                    </div>
                    <div className="border-2 size-5 rounded-full mt-1 p-0.5 flex items-center justify-center transition-colors" style={{ borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))" }}>
                        <div className="size-2 bg-primary rounded-full transition-opacity" style={{ opacity: isActive ? 1 : 0 }}></div>
                    </div>
                </div>
            );
        })}

        {/* Dynamiczne obramowanie */}
        <div
          className="w-full h-16 absolute top-0 border-2 border-primary rounded-lg pointer-events-none"
          style={{
            transform: getActivePlanTransform(),
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        ></div>
      </div>

      <Button className="w-full" size="lg" onClick={handleGetStarted} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Get Started"}
      </Button>
    </div>
  );
}
