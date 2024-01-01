import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";
// TODO: Check if NestJS provides some standard approach
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "Match",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(to: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const related = (args.object as any)[relatedPropertyName];
          return to && related === to && to !== '';
        },
        defaultMessage(args: ValidationArguments) {
          return `Password don't match`
        }
      }
    });
  };
}