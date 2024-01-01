import { has, isString } from 'lodash';
export class AppResponse {
  statusCode = 200;
  message: any = '';
  data: any = [];

  constructor(props: Partial<AppResponse>) {
    if (has(props, 'message') || has(props, 'data')) {
      this.message = props.message;
      this.data = props.data;
    } else {
      if (Array.isArray(props) || typeof props === 'object') {
        this.data = props;
      } if (isString(props)) {
        this.message = props;
      }
    }
  }

  status(code?: number) {
    if (code) {
      this.statusCode = code;
    }
    return this.statusCode;
  }

  prop(key: string, value: any) {
    this[key] = value;
  }

}