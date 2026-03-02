jest.mock('../../../../common/db/models', () => ({
  Client: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  },
  User: {},
}));

jest.mock('../../../../redis/cache', () => ({
  getClientsCache: jest.fn(() => Promise.resolve(null)),
  setClientsCache: jest.fn(() => Promise.resolve()),
  invalidateClientsCache: jest.fn(() => Promise.resolve()),
  invalidateStatsCache: jest.fn(() => Promise.resolve()),
}));

const { Client } = require('../../../../common/db/models');
const clientsService = require('../clients.service');

describe('clients.service', () => {
  const adminUser = { _id: 'admin1', role: 'admin' };
  const managerUser = { _id: 'mgr1', role: 'manager' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should not filter by managerId for admin', async () => {
      Client.find.mockReturnValue({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: () => Promise.resolve([]),
              }),
            }),
          }),
        }),
      });
      Client.countDocuments.mockResolvedValue(0);

      await clientsService.list(adminUser, { page: 1, limit: 10 });

      expect(Client.find).toHaveBeenCalledWith(expect.not.objectContaining({ managerId: expect.anything() }));
    });

    it('should filter by managerId for manager', async () => {
      Client.find.mockReturnValue({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: () => Promise.resolve([]),
              }),
            }),
          }),
        }),
      });
      Client.countDocuments.mockResolvedValue(0);

      await clientsService.list(managerUser, { page: 1, limit: 10 });

      expect(Client.find).toHaveBeenCalledWith(expect.objectContaining({ managerId: 'mgr1' }));
    });
  });

  describe('remove', () => {
    it('should allow admin to delete', async () => {
      Client.findByIdAndDelete.mockResolvedValue({ _id: 'c1' });

      await clientsService.remove('c1', adminUser);

      expect(Client.findByIdAndDelete).toHaveBeenCalledWith('c1');
    });

    it('should reject manager delete', async () => {
      await expect(clientsService.remove('c1', managerUser))
        .rejects.toThrow('Only admin can delete');
      expect(Client.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});
