import { useState } from 'react';
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    Code,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useToast,
    Spinner,
    Badge,
    Divider
} from '@chakra-ui/react';

export default function MigrationsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [migrations, setMigrations] = useState([]);
    const toast = useToast();

    // Load available migrations
    const loadMigrations = async () => {
        try {
            const res = await fetch('/api/migrations/run');
            const data = await res.json();
            setMigrations(data.migrations || []);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load migrations',
                status: 'error',
                duration: 3000
            });
        }
    };

    // Run migration
    const runMigration = async (migrationName) => {
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/migrations/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ migration: migrationName })
            });

            const data = await res.json();
            setResult(data);

            if (data.success) {
                toast({
                    title: 'Migration Successful!',
                    description: `${data.successCount} statements executed`,
                    status: 'success',
                    duration: 5000
                });
            } else {
                toast({
                    title: 'Migration Completed with Errors',
                    description: `${data.errorCount} errors, ${data.successCount} successful`,
                    status: 'warning',
                    duration: 5000
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={8} maxW="1200px" mx="auto">
            <VStack align="stretch" spacing={6}>
                <Box>
                    <Text fontSize="2xl" fontWeight="bold">Database Migrations</Text>
                    <Text color="gray.600">Run database schema updates</Text>
                </Box>

                <Alert status="warning">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Admin Only</AlertTitle>
                        <AlertDescription>
                            Deze pagina is alleen toegankelijk voor administrators.
                            Wees voorzichtig met het runnen van migrations.
                        </AlertDescription>
                    </Box>
                </Alert>

                <Divider />

                {/* Week 1 Security Migration */}
                <Box borderWidth="1px" borderRadius="lg" p={6}>
                    <HStack justify="space-between" mb={4}>
                        <VStack align="start" spacing={1}>
                            <Text fontSize="lg" fontWeight="bold">001_week1_security</Text>
                            <Text fontSize="sm" color="gray.600">
                                Security & Infrastructure Updates
                            </Text>
                        </VStack>
                        <Button
                            colorScheme="blue"
                            onClick={() => runMigration('001_week1_security')}
                            isLoading={loading}
                            loadingText="Running..."
                        >
                            Run Migration
                        </Button>
                    </HStack>

                    <VStack align="start" spacing={2}>
                        <Text fontWeight="semibold">What it does:</Text>
                        <Box pl={4}>
                            <Text fontSize="sm">✓ Creates <Code>audit_logs</Code> table</Text>
                            <Text fontSize="sm">✓ Creates <Code>two_factor_attempts</Code> table</Text>
                            <Text fontSize="sm">✓ Creates <Code>rate_limit_violations</Code> table</Text>
                            <Text fontSize="sm">✓ Creates <Code>system_settings</Code> table</Text>
                            <Text fontSize="sm">✓ Adds 2FA fields to <Code>auth_users</Code></Text>
                            <Text fontSize="sm">✓ Adds RBAC fields to <Code>user_roles</Code></Text>
                            <Text fontSize="sm">✓ Adds permission fields to <Code>employees</Code></Text>
                        </Box>
                    </VStack>
                </Box>

                {/* Results */}
                {result && (
                    <Box borderWidth="1px" borderRadius="lg" p={6} bg={result.success ? 'green.50' : 'yellow.50'}>
                        <HStack mb={4}>
                            <Text fontSize="lg" fontWeight="bold">Migration Result</Text>
                            <Badge colorScheme={result.success ? 'green' : 'yellow'}>
                                {result.success ? 'Success' : 'Completed with Errors'}
                            </Badge>
                        </HStack>

                        <VStack align="start" spacing={2} mb={4}>
                            <Text>Total Statements: {result.totalStatements}</Text>
                            <Text color="green.600">Successful: {result.successCount}</Text>
                            {result.errorCount > 0 && (
                                <Text color="orange.600">Errors: {result.errorCount}</Text>
                            )}
                        </VStack>

                        {result.results && result.results.length > 0 && (
                            <Box>
                                <Text fontWeight="semibold" mb={2}>Details:</Text>
                                <VStack align="stretch" spacing={1} maxH="400px" overflowY="auto">
                                    {result.results.map((r, i) => (
                                        <Box
                                            key={i}
                                            p={2}
                                            bg={r.success ? 'white' : 'red.50'}
                                            borderRadius="md"
                                            fontSize="sm"
                                        >
                                            <HStack>
                                                <Text fontWeight="bold">#{r.index}</Text>
                                                <Badge colorScheme={r.success ? 'green' : 'red'}>
                                                    {r.success ? '✓' : '✗'}
                                                </Badge>
                                                <Code fontSize="xs">{r.preview}</Code>
                                            </HStack>
                                            {r.error && (
                                                <Text color="red.600" fontSize="xs" mt={1}>
                                                    Error: {r.error}
                                                </Text>
                                            )}
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Instructions */}
                <Box borderWidth="1px" borderRadius="lg" p={6} bg="blue.50">
                    <Text fontWeight="bold" mb={2}>📖 How to Use</Text>
                    <VStack align="start" spacing={2} fontSize="sm">
                        <Text>1. Make sure you're logged in as <strong>admin</strong></Text>
                        <Text>2. Click "Run Migration" button above</Text>
                        <Text>3. Wait for the migration to complete</Text>
                        <Text>4. Check the results below</Text>
                        <Text>5. Some errors are OK (e.g., "table already exists")</Text>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
}
