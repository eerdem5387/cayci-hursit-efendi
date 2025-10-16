"use client";
import { motion } from "framer-motion";
import Slider from "@/components/Slider";
import { PopularTeas, Brands, AboutTeaser, Pillars, VideoBanner } from "@/components/Sections";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function Home() {
  return (
    <motion.div
      className="pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Slider />
      </motion.div>
      <motion.div variants={itemVariants}>
        <PopularTeas />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Brands />
      </motion.div>
      <motion.div variants={itemVariants}>
        <AboutTeaser />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Pillars />
      </motion.div>
      <motion.div variants={itemVariants}>
        <VideoBanner />
      </motion.div>
    </motion.div>
  );
}
