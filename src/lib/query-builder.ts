export class QueryBuilder {
  query: any;
  where: any = {};
  orderBy: any = {};
  skip?: number;
  take?: number;
  cursor?: any;

  constructor(query: any) {
    this.query = query;
  }

  filter(fields: string[]) {
    for (const field of fields) {
      if (this.query[field] !== undefined) {
        if (this.query[field] === 'true' || this.query[field] === 'false') {
          this.where[field] = this.query[field] === 'true';
        } else {
          this.where[field] = this.query[field];
        }
      }
    }
    return this;
  }

  search(fields: string[], term?: string) {
    if (term) {
      this.where.OR = fields.map(field => ({
        [field]: { contains: term, mode: 'insensitive' }
      }));
    }
    return this;
  }

  dateRange(field: string, startDate?: string, endDate?: string) {
    if (startDate || endDate) {
      this.where[field] = {};
      if (startDate) this.where[field].gte = new Date(startDate);
      if (endDate) this.where[field].lte = new Date(endDate);
    }
    return this;
  }

  sort(defaultSort: string = 'createdAt', defaultOrder: 'asc' | 'desc' = 'desc') {
    const sortBy = this.query.sortBy || defaultSort;
    const sortOrder = this.query.sortOrder === 'asc' ? 'asc' : defaultOrder;
    this.orderBy = { [sortBy]: sortOrder };
    return this;
  }

  paginate() {
    // Check if cursor based or offset based
    if (this.query.cursor) {
      this.cursor = { id: this.query.cursor };
      this.take = Number(this.query.limit) || 20;
      this.skip = 1; // Skip the cursor itself
    } else {
      const page = Math.max(1, Number(this.query.page) || 1);
      const limit = Math.max(1, Number(this.query.limit) || 20);
      this.skip = (page - 1) * limit;
      this.take = limit;
    }
    return this;
  }

  build() {
    const args: any = {
      where: this.where,
      orderBy: this.orderBy,
    };
    if (this.skip !== undefined) args.skip = this.skip;
    if (this.take !== undefined) args.take = this.take;
    if (this.cursor !== undefined) args.cursor = this.cursor;
    
    return args;
  }
}
