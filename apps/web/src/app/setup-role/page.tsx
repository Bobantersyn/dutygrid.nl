"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Shield, Users, Calendar, Settings } from "lucide-react";

export default function SetupRolePage() {
  const { data: user, loading: userLoading } = useUser();
  const [selectedRole, setSelectedRole] = useState("beveiliger");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        if (!response.ok) throw new Error("Failed to fetch employees");
        const data = await response.json();
        setEmployees(data.employees || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const checkExistingRole = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch("/api/user-role");
        if (response.ok) {
          const data = await response.json();
          // Only redirect if they already have a role
          if (data.role) {
            window.location.href = "/";
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkExistingRole();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          employee_id:
            selectedEmployee && selectedRole === "beveiliger"
              ? parseInt(selectedEmployee)
              : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set role");
      }

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Er is iets misgegaan. Probeer opnieuw.");
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Laden...</p>
        </div>
      </div>
    );
  }

  const roles = [
    {
      id: "beveiliger",
      name: "Beveiliger",
      description: "Zie alleen je eigen planning",
      icon: Shield,
      color: "blue",
      requiresEmployee: true,
    },
    {
      id: "beveiliger_extended",
      name: "Beveiliger+",
      description: "Eigen planning + beschikbaarheid instellen",
      icon: Users,
      color: "green",
      requiresEmployee: true,
    },
    {
      id: "planner",
      name: "Planner",
      description: "Teamplanning beheren en diensten inplannen",
      icon: Calendar,
      color: "purple",
      requiresEmployee: false,
    },
    {
      id: "admin",
      name: "Beheerder",
      description: "Volledige toegang tot alle functies",
      icon: Settings,
      color: "orange",
      requiresEmployee: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kies je rol</h1>
          <p className="text-gray-600 mb-8">
            Selecteer de rol die bij jouw functie past
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                const colorClasses = {
                  blue: "border-blue-500 bg-blue-50",
                  green: "border-green-500 bg-green-50",
                  purple: "border-purple-500 bg-purple-50",
                  orange: "border-orange-500 bg-orange-50",
                };
                const iconColorClasses = {
                  blue: "text-blue-600",
                  green: "text-green-600",
                  purple: "text-purple-600",
                  orange: "text-orange-600",
                };

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? colorClasses[role.color]
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          isSelected ? `bg-${role.color}-100` : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={
                            isSelected
                              ? iconColorClasses[role.color]
                              : "text-gray-600"
                          }
                          size={24}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {role.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedRole === "beveiliger" && employees.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Selecteer je medewerker profiel
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">Kies een medewerker...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Bezig..." : "Doorgaan naar Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
