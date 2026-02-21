"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Search,
  Grid,
  List,
  Filter,
  Shield,
  ShieldCheck,
  ShieldOff,
  Circle,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [flexFilter, setFlexFilter] = useState("all");
  const [passFilter, setPassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"

  const { data, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
  });

  const employees = data?.employees || [];

  // Get unique job titles
  const jobTitles = useMemo(() => {
    const titles = [
      ...new Set(employees.map((e) => e.job_title).filter(Boolean)),
    ];
    return titles.sort();
  }, [employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        (employee.first_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (employee.last_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (employee.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (employee.email?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        );

      const matchesFlex = flexFilter === "all" || (flexFilter === "flex" ? employee.is_flex : !employee.is_flex);
      const matchesPass =
        passFilter === "all" || employee.pass_type === passFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? employee.active : !employee.active);
      const matchesJob =
        jobFilter === "all" || employee.job_title === jobFilter;

      return (
        matchesSearch &&
        matchesFlex &&
        matchesPass &&
        matchesStatus &&
        matchesJob
      );
    });
  }, [employees, searchTerm, flexFilter, passFilter, statusFilter, jobFilter]);

  const PassBadge = ({ type }) => {
    if (type === "groen") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          <ShieldCheck size={14} />
          Groene Pas
        </span>
      );
    } else if (type === "grijs") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
          <Shield size={14} />
          Grijze Pas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
        <ShieldOff size={14} />
        Geen Pas
      </span>
    );
  };

  const FlexBadge = ({ isFlex }) => {
    if (isFlex) {
      return (
        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
          Flex-pool
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
        Vast
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
              >
                ← Terug naar Dashboard
              </a>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="text-blue-600" size={32} />
                Medewerkers
              </h1>
              <p className="text-gray-600 mt-1">
                Beheer alle medewerkers en hun gegevens
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/cao-management"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Filter size={18} />
                CAO Beheer
              </a>
              <a
                href="/employees/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Nieuwe Medewerker
              </a>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Zoek op naam of email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={flexFilter}
              onChange={(e) => setFlexFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle contracten</option>
              <option value="vaste">Vaste Krijger</option>
              <option value="flex">Flex-pool</option>
            </select>

            <select
              value={passFilter}
              onChange={(e) => setPassFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle passen</option>
              <option value="groen">Groene Pas</option>
              <option value="grijs">Grijze Pas</option>
              <option value="geen">Geen Pas</option>
            </select>

            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle functies</option>
              {jobTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle statussen</option>
              <option value="active">Actief</option>
              <option value="inactive">Inactief</option>
            </select>
          </div>

          {/* View Mode Toggle + Stats */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredEmployees.length} van {employees.length} medewerkers
            </div>
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 rounded transition-colors ${viewMode === "cards"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded transition-colors ${viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Laden...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {employees.length === 0
                ? "Nog geen medewerkers"
                : "Geen medewerkers gevonden"}
            </h3>
            <p className="text-gray-600 mb-6">
              {employees.length === 0
                ? "Voeg je eerste medewerker toe om te beginnen"
                : "Probeer een andere zoekopdracht of filter"}
            </p>
            {employees.length === 0 && (
              <a
                href="/employees/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Nieuwe Medewerker
              </a>
            )}
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => {
              const displayName =
                employee.first_name && employee.last_name
                  ? `${employee.first_name} ${employee.last_name}`
                  : employee.name;

              return (
                <a
                  key={employee.id}
                  href={`/employees/${employee.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* Profile Photo */}
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative flex items-center justify-center">
                    {employee.profile_photo ? (
                      <img
                        src={employee.profile_photo}
                        alt={displayName}
                        className="w-40 h-40 object-cover rounded-xl border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-40 h-40 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                        <Users className="text-gray-300" size={64} />
                      </div>
                    )}
                    {!employee.active && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                        Inactief
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {displayName}
                    </h3>
                    {employee.job_title && (
                      <p className="text-sm text-gray-600 mb-3">
                        {employee.job_title}
                      </p>
                    )}

                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="truncate">{employee.email}</div>
                      {employee.phone && <div>{employee.phone}</div>}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <PassBadge type={employee.pass_type} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Contract</span>
                        <FlexBadge isFlex={employee.is_flex} />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Medewerker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Functie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Pas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Contract
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => {
                    const displayName =
                      employee.first_name && employee.last_name
                        ? `${employee.first_name} ${employee.last_name}`
                        : employee.name;

                    return (
                      <tr
                        key={employee.id}
                        onClick={() =>
                          (window.location.href = `/employees/${employee.id}`)
                        }
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {employee.profile_photo ? (
                              <img
                                src={employee.profile_photo}
                                alt={displayName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                <Users className="text-blue-600" size={20} />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">
                                {displayName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.job_title || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PassBadge type={employee.pass_type} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FlexBadge isFlex={employee.is_flex} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${employee.active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                              }`}
                          >
                            <Circle
                              size={8}
                              className={
                                employee.active
                                  ? "fill-green-600"
                                  : "fill-red-600"
                              }
                            />
                            {employee.active ? "Actief" : "Inactief"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
