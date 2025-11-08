'use client';

import { FormButtons, FormDivider, Table } from '@/components';
import { RecordViolationDialog } from '@/components/borrow-records/RecordViolationDialog';
import { useReturnBorrowRecordForm } from '@/lib/hooks';
import { formatDate } from '@/lib/utils';
import { BorrowRecordWithDetails } from '@/types/borrow-record';
import { Box, HStack, Stack, Text, VStack } from '@chakra-ui/react';

export function ReturnBorrowRecordForm({
  borrowRecord,
  onClose,
  onSuccess,
}: {
  borrowRecord: BorrowRecordWithDetails;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const {
    isSubmitting,
    pendingViolations,
    violationDialogOpen,
    selectedBookItem,
    items,
    tableData,
    columns,
    totalViolationAmount,
    totalViolationPoints,
    selectedBookItemNewCondition,
    initialViolationData,
    handleViolationConfirm,
    handleViewViolation,
    handleSubmit,
    handleCloseViolationDialog,
    getViolationPolicyInfo,
  } = useReturnBorrowRecordForm({
    borrowRecord,
    onSuccess,
  });

  return (
    <>
      <Stack as="form" onSubmit={handleSubmit} height="100%" gap={0} px={1}>
        <Box flex="1" overflowY="auto">
          <Stack gap={4} py={4}>
            <VStack align="stretch" gap={2}>
              <Text fontWeight="bold">Borrow Record ID: {borrowRecord.id}</Text>
              <HStack gap={4} flexWrap="wrap" fontSize="sm">
                <Text>
                  <b>Borrower:</b> {borrowRecord.user?.fullName}
                </Text>
                <Text>
                  <b>Borrow Date:</b> {formatDate(borrowRecord.borrowDate)}
                </Text>
                <Text>
                  <b>Expected Return:</b> {formatDate(borrowRecord.returnDate)}
                </Text>
              </HStack>
            </VStack>

            <FormDivider />

            <Box>
              <Text fontWeight="semibold" mb={3}>
                Books to Return ({items.length})
              </Text>
              <Text fontSize="sm" color="secondaryText.500" mb={4}>
                Review and update condition for each book item if needed
              </Text>
              <Table
                columns={columns}
                data={tableData}
                page={1}
                pageSize={10}
                total={tableData.length}
                loading={false}
                hidePageSizeSelect
              />
            </Box>

            {/* Violation Summary */}
            {Object.keys(pendingViolations).length > 0 && (
              <Box>
                <FormDivider />
                <VStack align="stretch" gap={3}>
                  <HStack>
                    <Text fontWeight="semibold" fontSize="md">
                      Recorded Violations ({Object.keys(pendingViolations).length})
                    </Text>
                  </HStack>

                  <VStack align="stretch" gap={2}>
                    {Object.values(pendingViolations).map(violation => {
                      const bookItem = items.find(
                        bb => bb.bookItem.id === violation.bookItemId
                      )?.bookItem;
                      const policyInfo = getViolationPolicyInfo(violation.policyId);
                      return (
                        <Box
                          key={violation.bookItemId}
                          p={3}
                          bg="white"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="primary.500"
                        >
                          <HStack justify="space-between" align="start">
                            <VStack align="start" gap={1} flex="1">
                              <Box
                                width="100%"
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <HStack>
                                  <Text fontWeight="medium" fontSize="sm">
                                    {bookItem?.code}
                                  </Text>
                                  <Text fontSize="sm">-</Text>
                                  <Text fontSize="sm">{bookItem?.book?.title || 'N/A'}</Text>
                                </HStack>
                              </Box>
                              <Box
                                width="100%"
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Text fontSize="sm" color="secondaryText.500">
                                  {policyInfo.name} - {violation.amount.toLocaleString('vi-VN')} VND
                                </Text>
                                <Text
                                  fontSize="sm"
                                  cursor="pointer"
                                  textDecoration="underline"
                                  onClick={() => handleViewViolation(violation)}
                                >
                                  View Detail
                                </Text>
                              </Box>
                            </VStack>
                          </HStack>
                        </Box>
                      );
                    })}
                  </VStack>

                  <Box borderRadius="md" width="fit-content">
                    <HStack justify="space-between">
                      <Text fontWeight="medium" fontSize="sm">
                        Total Penalty:
                      </Text>
                      <Text fontWeight="bold" fontSize="sm">
                        {totalViolationAmount.toLocaleString('vi-VN')} VND
                      </Text>
                    </HStack>
                    <HStack justify="space-between" mt={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        Total Violation Points:
                      </Text>
                      <Text fontWeight="bold" fontSize="sm">
                        +{totalViolationPoints} points
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </Box>
            )}
          </Stack>
        </Box>

        <Box>
          <FormButtons
            submitLabel="Confirm Return"
            cancelLabel="Cancel"
            isSubmitting={isSubmitting}
            onCancel={onClose}
          />
        </Box>
      </Stack>

      {/* Violation Dialog */}
      {selectedBookItem && (
        <RecordViolationDialog
          isOpen={violationDialogOpen}
          onClose={handleCloseViolationDialog}
          onConfirm={handleViolationConfirm}
          borrowRecord={borrowRecord}
          bookItem={selectedBookItem}
          newCondition={selectedBookItemNewCondition}
          initialViolation={initialViolationData}
        />
      )}
    </>
  );
}
