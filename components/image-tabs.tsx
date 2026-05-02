"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Briefcase, CheckCircle2, TrendingUp } from "lucide-react";
function ImageTabs() {
  const [activeTab, setActiveTab] = useState("organized"); //organize,hired,boards
  return (
    <div>
      <section className="border-t bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl ">
            {/* tabs */}
            <div className="flex gap-2 justify-center mb-4">
              <Button
                onClick={() => setActiveTab("organized")}
                className={`rounded-lg px-6 text-sm font-medium transition-colors ${activeTab === "organized" ? "bg-primary" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Organize Applications
              </Button>
              <Button
                onClick={() => setActiveTab("hired")}
                className={`rounded-lg px-6 text-sm font-medium transition-colors ${activeTab === "hired" ? "bg-primary" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Get Hired
              </Button>
              <Button
                onClick={() => setActiveTab("boards")}
                className={`rounded-lg px-6 text-sm font-medium transition-colors ${activeTab === "boards" ? "bg-primary" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Manage Boards
              </Button>
            </div>
          </div>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-lg border border-gray-200 shadow-xl min-h-90 w-full">
            {activeTab === "organized" && (
              <Image
                src={"/hero-images/hero-image-1.png"}
                alt="organize application"
                fill
                className="object-cover"
              />
            )}

            {activeTab === "hired" && (
              <Image
                src={"/hero-images/hero-image2.jpg"}
                alt="get hired"
                fill
                className="object-cover"
              />
            )}

            {activeTab === "boards" && (
              <Image
                src={"/hero-images/hero-image-2.png"}
                alt="manage boards"
                fill
                className="object-cover"
              />
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-black">
                Organize Applications
              </h3>
              <p className="text-muted-foreground">
                Create custom boards and columns to track your job applications
                at every stage of the process.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-black">
                Track Progress
              </h3>
              <p className="text-muted-foreground">
                Monitor your application status from applied to interview to
                offer with visual Kanban boards.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-black">
                Stay Organized
              </h3>
              <p className="text-muted-foreground">
                Never lose track of an application. Keep all your job search
                information in one centralized place.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ImageTabs;
