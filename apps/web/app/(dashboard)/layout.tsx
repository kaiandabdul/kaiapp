import DashboardUI from "../../components/layouts/dashboard-layout";

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return <DashboardUI>{children}</DashboardUI>;
}
