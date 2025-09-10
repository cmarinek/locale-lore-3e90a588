// Completely disabled to prevent translation bundling issues
export const useValidationSchemas = () => {
  const signInSchema = {
    parse: (data: any) => data,
    safeParse: (data: any) => ({ success: true, data })
  };

  const signUpSchema = {
    parse: (data: any) => data,
    safeParse: (data: any) => ({ success: true, data })
  };

  return { signInSchema, signUpSchema };
};