import React, { FC } from "react";
import clsx from "clsx";
import { Breadcrumb } from "@/http/types";

interface Props {
  data: Breadcrumb[];
  onBreadcrumbClick: (path: string) => void;
}

const Breadcrumbs:FC<Props> = ({ data, onBreadcrumbClick }) => {
  return (
    <div className="flex items-center flex-wrap">
      {data.map((breadcrumb, idx) => (
        <React.Fragment key={`breadcrumb-${idx}`}>
          <button
            onClick={() => onBreadcrumbClick(breadcrumb.path)}
            className={clsx("text-sm font-semibold", data.length - 1 !== idx ? "text-main" : "text-[#7D7C84]")}
            disabled={data.length - 1 === idx}
          >
            {breadcrumb.title}
          </button>
          {data.length - 1 !== idx && (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 16L14 12L10 8"
                stroke="#031C2C"
                strokeOpacity="0.5"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default Breadcrumbs;
