"use client";

import { useState } from "react";
import { FileText, Shield } from "lucide-react";
import { useEmployeeDetail } from "@/hooks/useEmployeeDetail";
import { useEmployeeShifts } from "@/hooks/useEmployeeShifts";
import { useCaoTypes } from "@/hooks/useCaoTypes";
import { useEmployeeFileUpload } from "@/hooks/useEmployeeFileUpload";
import { EmployeeHeader } from "@/components/EmployeeDetail/EmployeeHeader";
import { PersonalInfoForm } from "@/components/EmployeeDetail/PersonalInfoForm";
import { ShiftsHistory } from "@/components/EmployeeDetail/ShiftsHistory";
import { ProfilePhotoUpload } from "@/components/EmployeeDetail/ProfilePhotoUpload";
import { DocumentUpload } from "@/components/EmployeeDetail/DocumentUpload";
import { DeleteConfirmationModal } from "@/components/EmployeeDetail/DeleteConfirmationModal";
import { LoadingState } from "@/components/EmployeeDetail/LoadingState";
import { ErrorState } from "@/components/EmployeeDetail/ErrorState";
import { AvailabilityView } from "@/components/EmployeeDetail/AvailabilityView";

export default function EmployeeDetailPage({ params }) {
  const { id } = params;
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    data,
    isLoading,
    fetchError,
    formData,
    setFormData,
    error,
    setError,
    updateMutation,
    deleteMutation,
  } = useEmployeeDetail(id);

  const { shifts } = useEmployeeShifts(id);
  const { caoTypes } = useCaoTypes();

  const { uploadingField, handleFileUpload, handleRemoveFile } =
    useEmployeeFileUpload(updateMutation, setError);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    updateMutation.mutate(
      {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        home_address: formData.home_address,
        cao_type: formData.cao_type,
        max_hours_per_week: parseInt(formData.max_hours_per_week),
        max_hours_per_day: parseInt(formData.max_hours_per_day),
        job_title: formData.job_title,
        contract_type: formData.contract_type,
        pass_type: formData.pass_type,
        active: formData.active,
        planning_visibility_weeks: parseInt(
          formData.planning_visibility_weeks || 1,
        ),
        can_manage_own_availability:
          formData.can_manage_own_availability !== false,
        object_labels: formData.object_labels?.map(l => l.id) || [],
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(data.employee);
    setError(null);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (fetchError || !data?.employee || !formData) {
    return <ErrorState />;
  }

  const employee = data.employee;
  const displayName =
    employee.first_name && employee.last_name
      ? `${employee.first_name} ${employee.last_name}`
      : employee.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <EmployeeHeader
        displayName={displayName}
        employee={employee}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancelEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <PersonalInfoForm
              formData={formData}
              setFormData={setFormData}
              isEditing={isEditing}
              onSubmit={handleSubmit}
              isSubmitting={updateMutation.isPending}
            />

            <AvailabilityView employeeId={id} />

            <ShiftsHistory shifts={shifts} />
          </div>

          {/* Right Column - Documents */}
          <div className="space-y-6">
            <ProfilePhotoUpload
              photoUrl={formData?.profile_photo}
              onUpload={handleFileUpload}
              onRemove={handleRemoveFile}
              isUploading={uploadingField === "profile_photo"}
            />

            <DocumentUpload
              title="Paspoort/ID"
              icon={FileText}
              documentUrl={formData.passport_document}
              fieldName="passport_document"
              onUpload={handleFileUpload}
              onRemove={handleRemoveFile}
              isUploading={uploadingField === "passport_document"}
              viewButtonColor="green"
            />

            <DocumentUpload
              title="Beveiligingspas"
              icon={Shield}
              documentUrl={formData.security_pass_document}
              fieldName="security_pass_document"
              onUpload={handleFileUpload}
              onRemove={handleRemoveFile}
              isUploading={uploadingField === "security_pass_document"}
              viewButtonColor="purple"
            />
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        displayName={displayName}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
