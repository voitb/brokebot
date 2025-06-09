import React from "react";
import { Button } from "../../../ui/button";

export function PricingInteraction({
  starterMonth,
  starterAnnual,
  proMonth,
  proAnnual,
}: {
  starterMonth: number;
  starterAnnual: number;
  proMonth: number;
  proAnnual: number;
}) {
  const [active, setActive] = React.useState(0);
  const [period, setPeriod] = React.useState(0);

  const handleChangePlan = (index: number) => {
    setActive(index);
  };

  const handleChangePeriod = (index: number) => {
    setPeriod(index);
    if (index === 0) {
      setStarter(starterMonth);
      setPro(proMonth);
    } else {
      setStarter(starterAnnual);
      setPro(proAnnual);
    }
  };

  const [starter, setStarter] = React.useState(starterMonth);
  const [pro, setPro] = React.useState(proMonth);

  return (
    <div className="border rounded-xl p-4 max-w-sm w-full flex flex-col items-center gap-4 bg-card">
      <div className="rounded-full relative w-full bg-muted p-1 flex items-center">
        <button
          className="font-medium rounded-full w-full py-2 px-3 text-sm z-20 transition-colors"
          onClick={() => handleChangePeriod(0)}
        >
          Monthly
        </button>
        <button
          className="font-medium rounded-full w-full py-2 px-3 text-sm z-20 transition-colors"
          onClick={() => handleChangePeriod(1)}
        >
          Yearly
        </button>
        <div
          className="py-2 px-3 flex items-center justify-center absolute inset-0 w-1/2 z-10"
          style={{
            transform: `translateX(${period * 100}%)`,
            transition: "transform 0.3s",
          }}
        >
          <div className="bg-background shadow-sm rounded-full w-full h-full border"></div>
        </div>
      </div>

      <div className="w-full relative flex flex-col items-center justify-center gap-3">
        <div
          className="w-full flex justify-between cursor-pointer border p-3 rounded-lg hover:bg-muted/50 transition-colors"
          onClick={() => handleChangePlan(0)}
        >
          <div className="flex flex-col items-start">
            <p className="font-semibold text-lg">Free</p>
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">$0.00</span>/month
            </p>
          </div>
          <div
            className="border-2 size-5 rounded-full mt-1 p-0.5 flex items-center justify-center transition-colors"
            style={{
              borderColor:
                active === 0 ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
          >
            <div
              className="size-2 bg-primary rounded-full transition-opacity"
              style={{
                opacity: active === 0 ? 1 : 0,
              }}
            ></div>
          </div>
        </div>

        <div
          className="w-full flex justify-between cursor-pointer border p-4 rounded-lg hover:bg-muted/50 transition-colors"
          onClick={() => handleChangePlan(1)}
        >
          <div className="flex flex-col items-start">
            <p className="font-semibold text-lg flex items-center gap-2">
              Starter
              <span className="py-0.5 px-2 rounded-md bg-yellow-100 text-yellow-800 text-xs font-medium dark:bg-yellow-900 dark:text-yellow-200">
                Popular
              </span>
            </p>
            <p className="text-muted-foreground text-sm flex">
              <span className="text-foreground font-medium flex items-center">
                ${starter}
              </span>
              /month
            </p>
          </div>
          <div
            className="border-2 size-5 rounded-full mt-1 p-0.5 flex items-center justify-center transition-colors"
            style={{
              borderColor:
                active === 1 ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
          >
            <div
              className="size-2 bg-primary rounded-full transition-opacity"
              style={{
                opacity: active === 1 ? 1 : 0,
              }}
            ></div>
          </div>
        </div>

        <div
          className="w-full flex justify-between cursor-pointer border p-4 rounded-lg hover:bg-muted/50 transition-colors"
          onClick={() => handleChangePlan(2)}
        >
          <div className="flex flex-col items-start">
            <p className="font-semibold text-lg">Pro</p>
            <p className="text-muted-foreground text-sm flex">
              <span className="text-foreground font-medium flex items-center">
                ${pro}
              </span>
              /month
            </p>
          </div>
          <div
            className="border-2 size-5 rounded-full mt-1 p-0.5 flex items-center justify-center transition-colors"
            style={{
              borderColor:
                active === 2 ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
          >
            <div
              className="size-2 bg-primary rounded-full transition-opacity"
              style={{
                opacity: active === 2 ? 1 : 0,
              }}
            ></div>
          </div>
        </div>

        <div
          className="w-full h-[76px] absolute top-0 border-2 border-primary rounded-lg pointer-events-none"
          style={{
            transform: `translateY(${active * 76 + 12 * active}px)`,
            transition: "transform 0.3s",
          }}
        ></div>
      </div>

      <Button className="w-full" size="lg">
        Get Started
      </Button>
    </div>
  );
}
