import React from 'react';

export const TableSkeleton = () => (
  <div className="w-full space-y-4 animate-pulse">
    <div className="h-12 bg-gray-200 rounded-2xl w-full"></div>
    <div className="h-20 bg-white border border-gray-100 rounded-3xl w-full"></div>
    <div className="h-20 bg-white border border-gray-100 rounded-3xl w-full"></div>
    <div className="h-20 bg-white border border-gray-100 rounded-3xl w-full"></div>
  </div>
);

export const CardSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-8 animate-pulse">
    <div className="h-64 bg-white border border-gray-50 rounded-[2rem]"></div>
    <div className="h-64 bg-white border border-gray-50 rounded-[2rem]"></div>
  </div>
);

export const WhySkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-gray-200 rounded-xl w-1/3"></div>
    <div className="h-40 bg-teal-50/50 rounded-[2.5rem] border border-teal-100"></div>
  </div>
);

export default function RecommendationSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 space-y-12">
      <div className="space-y-4 pt-12">
        <div className="h-4 bg-gray-200 rounded-full w-24 animate-pulse"></div>
        <div className="h-16 bg-gray-200 rounded-3xl w-2/3 animate-pulse"></div>
        <div className="h-6 bg-gray-100 rounded-full w-1/2 animate-pulse"></div>
      </div>
      <TableSkeleton />
      <CardSkeleton />
      <WhySkeleton />
    </div>
  );
}
