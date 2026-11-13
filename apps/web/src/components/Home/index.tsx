import React from "react";
import { Suspense } from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";

const Home = () => {
  return (
    <main>
      <Hero />
      <Suspense><Categories /></Suspense>
      <NewArrival />
      <PromoBanner />
      <BestSeller />
      <CounDown />
      <Suspense><Testimonials /></Suspense>
      <Newsletter />
    </main>
  );
};

export default Home;
